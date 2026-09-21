import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconRefresh, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { JobState } from '~/generated-admin/graphql';

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
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton aria-label={t`Job Actions`} emphasis="subtle">
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {jobState === JobState.FAILED && onRetry && (
              <DropdownListItem
                startIcon={<IconRefresh />}
                onClick={handleRetry}
              >{t`Retry`}</DropdownListItem>
            )}
            <DropdownListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={handleDelete}
            >{t`Delete`}</DropdownListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
