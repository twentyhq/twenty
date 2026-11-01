import { useEffect, useRef, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';
import { type AssignSessionTrainerResult } from 'src/logic-functions/handlers/assign-session-trainer-handler';
export const ASSIGN_SESSION_TRAINER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '48fd1f55-900c-45db-909c-6ec5881be9ad';
const AssignSessionTrainerForm = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const classSessionId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;
  const [trainers, setTrainers] = useState<
    { id: string; name: string; active: boolean }[]
  >([]);
  const [trainerId, setTrainerId] = useState('');
  const [message, setMessage] = useState(
    'Выберите одного тренера для занятия.',
  );
  const [busy, setBusy] = useState(false);
  const requestKey = useRef<string>(crypto.randomUUID());
  useEffect(() => {
    if (!classSessionId) return;
    let mounted = true;
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
        } as never)) as unknown as {
          studioTrainers: {
            edges: { node: { id: string; name: string; active: boolean } }[];
          };
          classSessions: {
            edges: { node: { trainer: { id: string } | null } }[];
          };
        };
        if (!mounted) return;
        if (result.studioTrainers.edges.length === 1000)
          throw new Error(
            'Каталог слишком велик. Откройте тренера через поиск CRM.',
          );
        setTrainers(
          result.studioTrainers.edges
            .map(({ node }) => node)
            .filter(({ active }) => active),
        );
        setTrainerId(result.classSessions.edges[0]?.node.trainer?.id ?? '');
      } catch {
        if (mounted) setMessage('Не удалось загрузить каталог тренеров.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [classSessionId]);
  const assign = async () => {
    setBusy(true);
    try {
      const result = await new RestApiClient().post<AssignSessionTrainerResult>(
        '/s/studio/sessions/assign-trainer',
        { classSessionId, trainerId, requestKey: requestKey.current },
      );
      setMessage(
        result.success
          ? 'Тренер закреплён за занятием. Начисление будет отнесено к нему при закрытии.'
          : result.message,
      );
    } catch (error) {
      const body = error instanceof RestApiClientError ? error.body : null;
      setMessage(
        typeof body === 'object' &&
          body !== null &&
          'message' in body &&
          typeof body.message === 'string'
          ? body.message
          : 'Назначение не подтверждено. Повторите операцию.',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <h2>Назначить тренера</h2>
      <p role="status">{message}</p>
      <label>
        Тренер{' '}
        <select
          value={trainerId}
          disabled={busy}
          onChange={(event) => {
            setTrainerId(event.target.value);
            requestKey.current = crypto.randomUUID();
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
      <button
        type="button"
        disabled={busy || !classSessionId || !trainerId}
        onClick={() => void assign()}
      >
        {busy ? 'Назначение…' : 'Закрепить тренера'}
      </button>
      <p>
        После начисления замену тренера выполняйте через «Начислить / исправить
        оплату тренера».
      </p>
    </div>
  );
};
export default defineFrontComponent({
  universalIdentifier:
    ASSIGN_SESSION_TRAINER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'assign-session-trainer',
  description: 'Assign one active catalog trainer to a class',
  component: AssignSessionTrainerForm,
});
