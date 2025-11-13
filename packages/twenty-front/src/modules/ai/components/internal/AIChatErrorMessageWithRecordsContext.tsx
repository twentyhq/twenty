import { AIChatErrorMessage } from '@/ai/components/AIChatErrorMessage';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';

export const AIChatErrorMessageWithRecordsContext = ({
  error,
}: {
  error: Error;
}) => {
  const { records } = useFindManyRecordsSelectedInContextStore({
    limit: 10,
  });

  return <AIChatErrorMessage error={error} records={records} />;
};
