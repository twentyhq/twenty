import { useLingui } from '@lingui/react/macro';
import { IconVersions } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CORE_WORKFLOW_VERSION_STATUS_LABELS } from '@/object-core/workflows/versions/constants/CoreWorkflowVersionStatusLabels';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type CoreWorkflowVersionStatus } from '~/generated/graphql';

type CoreWorkflowVersionsListItemProps = {
  id: string;
  label: string;
  createdAt: string;
  status: CoreWorkflowVersionStatus;
  onSelect: () => void;
};

export const CoreWorkflowVersionsListItem = ({
  id,
  label,
  createdAt,
  status,
  onSelect,
}: CoreWorkflowVersionsListItemProps) => {
  const { t, i18n } = useLingui();
  const statusLabel = t(CORE_WORKFLOW_VERSION_STATUS_LABELS[status]);

  return (
    <SelectableListItem itemId={id} onEnter={onSelect}>
      <CommandMenuItem
        id={id}
        Icon={IconVersions}
        label={i18n.date(createdAt, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        description={t`${label}, ${statusLabel}`}
        onClick={onSelect}
      />
    </SelectableListItem>
  );
};
