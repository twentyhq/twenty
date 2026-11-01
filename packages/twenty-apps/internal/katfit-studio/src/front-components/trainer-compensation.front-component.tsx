import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  openSidePanelPage,
  SidePanelPages,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';
import { type CompensationResult } from 'src/logic-functions/handlers/trainer-compensation-handler';
import {
  type AttendanceCorrection,
  type CompensationSnapshot,
} from 'src/logic-functions/utils/trainer-compensation';

export const TRAINER_COMPENSATION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'fa8389e9-8d61-4eec-8e4a-812b3ca01d29';
type TrainerOption = { id: string; name: string; active: boolean };
type EntryOption = {
  id: string;
  revision: number;
  entryType: string;
  state: string;
  snapshot: string;
  previewToken: string;
  previousEntryId: string | null;
  reason: string;
  requestKey: string;
};
const FIELD_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};
const money = (amountMicros: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(
    amountMicros / 1_000_000,
  );
const errorMessage = (error: unknown): string => {
  const body = error instanceof RestApiClientError ? error.body : null;
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof body.message === 'string'
  )
    return body.message;
  return error instanceof Error
    ? error.message
    : 'Не удалось выполнить операцию.';
};

const TrainerCompensationForm = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const classSessionId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [trainerId, setTrainerId] = useState('');
  const [latestEntry, setLatestEntry] = useState<EntryOption | null>(null);
  const [reason, setReason] = useState('');
  const [attendanceCorrections, setAttendanceCorrections] = useState<
    AttendanceCorrection[]
  >([]);
  const [preview, setPreview] = useState<{
    snapshot: CompensationSnapshot;
    previewToken: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const requestKey = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (!classSessionId) return;
    let active = true;
    void (async () => {
      try {
        const result = (await new CoreApiClient().query({
          studioTrainers: {
            __args: { first: 1000 },
            edges: { node: { id: true, name: true, active: true } },
          },
          classSessions: {
            __args: { filter: { id: { eq: classSessionId } }, first: 1 },
            edges: { node: { trainer: { id: true } } },
          },
          trainerPayEntries: {
            __args: {
              filter: { classSessionId: { eq: classSessionId } },
              first: 1000,
            },
            edges: {
              node: {
                id: true,
                revision: true,
                entryType: true,
                state: true,
                snapshot: true,
                previewToken: true,
                previousEntryId: true,
                reason: true,
                requestKey: true,
              },
            },
          },
        } as never)) as unknown as {
          studioTrainers: { edges: { node: TrainerOption }[] };
          classSessions: {
            edges: { node: { trainer: { id: string } | null } }[];
          };
          trainerPayEntries: { edges: { node: EntryOption }[] };
        };
        if (!active) return;
        if (
          result.trainerPayEntries.edges.length === 1000 ||
          result.studioTrainers.edges.length === 1000
        )
          throw new Error('Слишком много данных для безопасного просмотра.');
        const latest =
          result.trainerPayEntries.edges
            .map(({ node }) => node)
            .filter(({ entryType }) => entryType === 'ACCRUAL')
            .sort((left, right) => right.revision - left.revision)[0] ?? null;
        setTrainers(
          result.studioTrainers.edges
            .map(({ node }) => node)
            .filter(({ active: enabled }) => enabled),
        );
        setLatestEntry(latest);
        setTrainerId(result.classSessions.edges[0]?.node.trainer?.id ?? '');
        if (latest?.state === 'PENDING') {
          const snapshot = JSON.parse(latest.snapshot) as CompensationSnapshot;
          setPreview({ snapshot, previewToken: latest.previewToken });
          setTrainerId(snapshot.session.trainer?.id ?? '');
          setReason(latest.reason);
          setAttendanceCorrections(
            snapshot.attendanceCorrections.map(({ bookingId, status }) => ({
              bookingId,
              status,
            })),
          );
          requestKey.current = latest.requestKey;
        }
      } catch (loadError) {
        if (active) setError(errorMessage(loadError));
      }
    })();
    return () => {
      active = false;
    };
  }, [classSessionId]);

  const pending = latestEntry?.state === 'PENDING';
  const previousEntryId = pending
    ? latestEntry.previousEntryId
    : latestEntry?.id;
  const perform = async (previewOnly: boolean) => {
    if (!classSessionId || !trainerId) {
      setError('Выберите занятие и тренера.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await new RestApiClient().post<CompensationResult>(
        '/s/studio/compensation/close',
        {
          classSessionId,
          trainerId,
          requestKey: requestKey.current,
          previousEntryId: previousEntryId || undefined,
          reason,
          attendanceCorrections,
          previewOnly,
          previewToken: preview?.previewToken,
        },
      );
      if (!result.success) {
        setError(result.message);
        if (!pending) setPreview(null);
        return;
      }
      if (result.preview) setPreview(result);
      else {
        setEntryId(result.entryId);
        setPreview(null);
      }
    } catch (operationError) {
      setError(errorMessage(operationError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
        fontFamily: 'var(--t-font-family)',
        color: 'var(--t-font-color-primary)',
        overflowY: 'auto',
      }}
    >
      <h2>
        {previousEntryId
          ? 'Исправить начисление тренеру'
          : 'Закрыть занятие и начислить оплату'}
      </h2>
      {!classSessionId && <p role="alert">Выберите одно занятие.</p>}
      {latestEntry?.state === 'POSTED' && (
        <p>
          У занятия уже есть начисление. Исправление сохранит сторно прежней
          суммы и новое начисление.
        </p>
      )}
      {pending && (
        <p>
          Закрытие не завершено. Ниже сохранённый расчёт; подтвердите его
          повторно для завершения операции.
        </p>
      )}
      <label style={FIELD_STYLE}>
        Тренер
        <select
          value={trainerId}
          disabled={busy || pending || entryId !== null}
          onChange={(event) => {
            setTrainerId(event.target.value);
            setPreview(null);
          }}
        >
          <option value="">Выберите тренера</option>
          {trainers.map((trainer) => (
            <option key={trainer.id} value={trainer.id}>
              {trainer.name}
            </option>
          ))}
        </select>
      </label>
      <label style={FIELD_STYLE}>
        {previousEntryId
          ? 'Причина исправления (обязательно)'
          : 'Основание начисления'}
        <textarea
          value={reason}
          disabled={busy || pending || entryId !== null}
          onChange={(event) => {
            setReason(event.target.value);
            setPreview(null);
          }}
        />
      </label>
      {latestEntry && !pending && !entryId && (
        <fieldset disabled={busy}>
          <legend>Исправить фактическое посещение</legend>
          {(JSON.parse(latestEntry.snapshot) as CompensationSnapshot).bookings
            .filter((booking) =>
              ['ATTENDED', 'NO_SHOW', 'LATE_CANCEL'].includes(booking.status),
            )
            .map((booking) => (
              <label
                key={booking.id}
                style={{ ...FIELD_STYLE, marginBottom: 8 }}
              >
                {[booking.person?.name.firstName, booking.person?.name.lastName]
                  .filter(Boolean)
                  .join(' ') || booking.name}
                <select
                  value={
                    attendanceCorrections.find(
                      ({ bookingId }) => bookingId === booking.id,
                    )?.status ?? booking.status
                  }
                  onChange={(event) => {
                    const status = event.target
                      .value as AttendanceCorrection['status'];
                    setAttendanceCorrections((current) => [
                      ...current.filter(
                        ({ bookingId }) => bookingId !== booking.id,
                      ),
                      { bookingId: booking.id, status },
                    ]);
                    setPreview(null);
                  }}
                >
                  <option value="ATTENDED">Посетил</option>
                  <option value="NO_SHOW">Неявка</option>
                  <option value="LATE_CANCEL">Поздняя отмена</option>
                </select>
              </label>
            ))}
          <p>
            Исправляется факт присутствия для расчёта оплаты тренера. Списания
            клиентских посещений сохраняются.
          </p>
        </fieldset>
      )}
      {preview && (
        <div>
          <p>
            {preview.snapshot.session.name}
            <br />
            {new Date(preview.snapshot.session.startsAt).toLocaleString(
              'ru-RU',
            )}
            <br />
            Тренер: {preview.snapshot.session.trainer?.name}
          </p>
          <p>
            Посетило: {preview.snapshot.participantCount}. Тариф:{' '}
            {preview.snapshot.rate.name}, версия {preview.snapshot.rate.version}
            .
          </p>
          <strong>
            Начислить: {money(preview.snapshot.amount.amountMicros)}
          </strong>
          <ul>
            {preview.snapshot.bookings.map((booking) => (
              <li key={booking.id}>
                {[booking.person?.name.firstName, booking.person?.name.lastName]
                  .filter(Boolean)
                  .join(' ') || booking.name}{' '}
                —{' '}
                {booking.status === 'ATTENDED'
                  ? 'Посетил'
                  : booking.status === 'NO_SHOW'
                    ? 'Неявка'
                    : booking.status === 'LATE_CANCEL'
                      ? 'Поздняя отмена'
                      : 'Отмена'}
              </li>
            ))}
          </ul>
          <details>
            <summary>Полные данные расчёта для журнала</summary>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {JSON.stringify(preview.snapshot, null, 2)}
            </pre>
          </details>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {entryId ? (
        <div role="status">
          Начисление сохранено.{' '}
          <button
            type="button"
            onClick={() =>
              void openSidePanelPage({
                page: SidePanelPages.ViewRecord,
                recordId: entryId,
                objectNameSingular: 'trainerPayEntry',
              })
            }
          >
            Открыть журнал
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={
            busy ||
            !classSessionId ||
            !trainerId ||
            Boolean(previousEntryId && !reason.trim())
          }
          onClick={() => void perform(!preview)}
        >
          {busy
            ? 'Выполняется…'
            : preview
              ? pending
                ? 'Завершить начисление'
                : 'Подтвердить начисление'
              : 'Проверить расчёт'}
        </button>
      )}
    </div>
  );
};
export default defineFrontComponent({
  universalIdentifier:
    TRAINER_COMPENSATION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'trainer-compensation',
  description:
    'Close a class and record trainer compensation with a complete audit snapshot',
  component: TrainerCompensationForm,
});
