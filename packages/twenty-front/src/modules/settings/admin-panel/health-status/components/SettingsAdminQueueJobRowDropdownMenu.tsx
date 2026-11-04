import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { IconDotsVertical, IconRefresh, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { isDefined } from 'twenty-shared/utils';
import { JobState } from '~/generated-admin/graphql';
import { useLingui } from '@lingui/react/macro';

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
  const { t } = useLingui();
  const dropdownId = `queue-job-row-${jobId}`;
  return (
    <DropdownRoot type="menu" dropdownId={dropdownId}>
      <Dropdown.Trigger
        render={
          <LightIconButton aria-label={t`Job Actions`} emphasis="subtle">
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent side="right" align="start">
        <Dropdown.Section>
          {jobState === JobState.FAILED && isDefined(onRetry) && (
            <Dropdown.ActionItem
              startIcon={<IconRefresh />}
              onClick={onRetry}
            >{t`Retry`}</Dropdown.ActionItem>
          )}
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={onDelete}
          >{t`Delete`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
