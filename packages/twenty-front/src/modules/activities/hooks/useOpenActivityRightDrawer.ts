import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const useOpenActivityRightDrawer = ({
  objectNameSingular,
}: {
  objectNameSingular: CoreObjectNameSingular;
}) => {
  const { openRecordInCommandMenu } = useCommandMenu();

  return (activityId: string) => {
    openRecordInCommandMenu({
      recordId: activityId,
      objectNameSingular,
      isNewRecord: false,
    });
  };
};
