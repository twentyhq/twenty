import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconRefresh, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { JobState } from '~/generated-admin/graphql';
import { Menu } from 'twenty-ui/primitives/surfaces';

type SettingsAdminQueueJobRowDropdownMenuProps = {
  jobId: string;
  jobState: JobState;
  onRetry?: () => void;
  onDelete: () => void;
};

export const SettingsAdminQueueJobRowDropdownMenu = ({
  jobId,
  jobState,
  onRetry,
  onDelete,
}: SettingsAdminQueueJobRowDropdownMenuProps) => {
  const dropdownId = `queue-job-row-${jobId}`;
  const { closeDropdown } = useCloseDropdown();

  const handleRetry = () => {
    onRetry?.();
    closeDropdown(dropdownId);
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown(dropdownId);
  };

  return (
    <DropdownMenu
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton aria-label={t`Job Actions`} emphasis="subtle">
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <Menu.Group>
            {jobState === JobState.FAILED && onRetry && (
              <Menu.Item
                startIcon={<IconRefresh />}
                onClick={handleRetry}
              >{t`Retry`}</Menu.Item>
            )}
            <Menu.Item
              color="danger"
              startIcon={<IconTrash />}
              onClick={handleDelete}
            >{t`Delete`}</Menu.Item>
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
