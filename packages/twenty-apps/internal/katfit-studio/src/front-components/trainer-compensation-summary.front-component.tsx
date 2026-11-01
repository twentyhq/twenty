import { useState } from 'react';
import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  openSidePanelPage,
  SidePanelPages,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';
import { type summarizeTrainerCompensation } from 'src/logic-functions/utils/trainer-compensation-summary';

export const TRAINER_COMPENSATION_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'b54514d1-61f6-41a2-a1a1-96a689f9f065';
const TrainerCompensationSummaryForm = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [report, setReport] = useState<ReturnType<
    typeof summarizeTrainerCompensation
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const formatAmount = (amountMicros: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amountMicros / 1_000_000);
  const load = async () => {
    setBusy(true);
    setError(null);
    setReport(null);
    try {
      const endDate = new Date(`${endsOn}T00:00:00+03:00`);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      const result = await new RestApiClient().post<
        | ({ success: true } & ReturnType<typeof summarizeTrainerCompensation>)
        | { success: false; message: string }
      >('/s/studio/compensation/summary', {
        trainerId: selectedRecordIds[0],
        startsAt: new Date(`${startsOn}T00:00:00+03:00`).toISOString(),
        endsAt: endDate.toISOString(),
      });
      if (result.success) setReport(result);
      else setError(result.message);
    } catch (loadError) {
      const body =
        loadError instanceof RestApiClientError ? loadError.body : null;
      setError(
        typeof body === 'object' &&
          body !== null &&
          'message' in body &&
          typeof body.message === 'string'
          ? body.message
          : 'Не удалось построить отчёт. Проверьте период.',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <h2>Зарплата тренера за период</h2>
      <label>
        С{' '}
        <input
          type="date"
          value={startsOn}
          onChange={(event) => {
            setStartsOn(event.target.value);
            setReport(null);
          }}
        />
      </label>
      <label>
        По (включительно){' '}
        <input
          type="date"
          value={endsOn}
          onChange={(event) => {
            setEndsOn(event.target.value);
            setReport(null);
          }}
        />
      </label>
      <span>Даты по московскому времени.</span>
      <button
        type="button"
        disabled={
          busy ||
          selectedRecordIds.length !== 1 ||
          !startsOn ||
          !endsOn ||
          startsOn > endsOn
        }
        onClick={() => void load()}
      >
        {busy ? 'Расчёт…' : 'Рассчитать'}
      </button>
      {error && <p role="alert">{error}</p>}
      {report && (
        <div>
          <p>
            Проведено занятий: {report.sessionCount}
            <br />
            <strong>Начислено: {formatAmount(report.amountMicros)}</strong>
          </p>
          {report.pendingSessionIds.length > 0 && (
            <p role="alert">
              Есть незавершённые операции: {report.pendingSessionIds.length}.
              Сумма предварительная и учитывает последние завершённые
              начисления.
            </p>
          )}
          <ul>
            {report.rows.map((row) => (
              <li key={row.entryId}>
                <button
                  type="button"
                  onClick={() =>
                    void openSidePanelPage({
                      page: SidePanelPages.ViewRecord,
                      objectNameSingular: 'trainerPayEntry',
                      recordId: row.entryId,
                    })
                  }
                >
                  {row.name}
                </button>{' '}
                · {row.participantCount} чел. · {formatAmount(row.amountMicros)}
              </li>
            ))}
          </ul>
          <p>
            Отчёт показывает начисления. Фактические выплаты здесь не
            учитываются.
          </p>
        </div>
      )}
    </div>
  );
};
export default defineFrontComponent({
  universalIdentifier:
    TRAINER_COMPENSATION_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'trainer-compensation-summary',
  description: 'Trainer compensation for a selected period',
  component: TrainerCompensationSummaryForm,
});
