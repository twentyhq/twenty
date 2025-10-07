import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';

export const SendMessageWithRecordsContextButton = () => {
  const { records } = useFindManyRecordsSelectedInContextStore({
    limit: 10,
  });

  return <SendMessageButton records={records} />;
};
