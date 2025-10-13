import { AIChatErrorMessage } from '@/ai/components/AIChatErrorMessage';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';

export const AIChatErrorMessageWithRecordsContext = ({
  error,
  isRetrying,
}: {
  error: Error;
  isRetrying?: boolean;
}) => {
  const { records } = useFindManyRecordsSelectedInContextStore({
    limit: 10,
  });

  return (
    <AIChatErrorMessage
      error={error}
      isRetrying={isRetrying}
      records={records}
    />
  );
};
