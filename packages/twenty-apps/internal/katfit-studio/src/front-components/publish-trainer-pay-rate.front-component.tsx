import { useState } from 'react';
import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';

export const PUBLISH_TRAINER_PAY_RATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'ef153727-800c-4888-941b-82b5d6fb2bd8';
const PublishTrainerPayRateForm = () => {
  const ids = useSelectedRecordIds();
  const [message, setMessage] = useState(
    'Публикация зафиксирует ставку персонального занятия или четыре ступени группового. Для новых ставок создайте новую версию тарифа.',
  );
  const [busy, setBusy] = useState(false);
  const publish = async () => {
    setBusy(true);
    try {
      const result = await new RestApiClient().post<{
        success: boolean;
        message?: string;
      }>('/s/studio/compensation/publish-rate', { payRateId: ids[0] });
      setMessage(
        result.success
          ? 'Тариф опубликован. Теперь назначьте его тренеру и задайте период действия.'
          : (result.message ?? 'Не удалось опубликовать тариф.'),
      );
    } catch (error) {
      const body = error instanceof RestApiClientError ? error.body : null;
      setMessage(
        typeof body === 'object' &&
          body !== null &&
          'message' in body &&
          typeof body.message === 'string'
          ? body.message
          : 'Не удалось опубликовать тариф.',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={{ padding: 16 }}>
      <h2>Опубликовать тариф тренера</h2>
      <p role="status">{message}</p>
      <button
        type="button"
        disabled={busy || ids.length !== 1}
        onClick={() => void publish()}
      >
        {busy ? 'Публикация…' : 'Опубликовать тариф'}
      </button>
    </div>
  );
};
export default defineFrontComponent({
  universalIdentifier:
    PUBLISH_TRAINER_PAY_RATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'publish-trainer-pay-rate',
  description: 'Publish the complete trainer pay rate version',
  component: PublishTrainerPayRateForm,
});
