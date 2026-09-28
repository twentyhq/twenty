import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';
import { IconMailCog, IconStatusChange, IconTrash } from 'twenty-ui/icon';

type SettingsUnsubscribersFilterMenuContentProps = {
  reasonLabel: string;
  topicLabel: string;
  hasActiveFilters: boolean;
  onClear: () => void;
};

export const SettingsUnsubscribersFilterMenuContent = ({
  reasonLabel,
  topicLabel,
  hasActiveFilters,
  onClear,
}: SettingsUnsubscribersFilterMenuContentProps) => {
  const { t } = useLingui();

  return (
    <Dropdown.Section>
      <Dropdown.ActionItem
        startIcon={<IconStatusChange />}
        description={reasonLabel}
        descriptionPlacement="end"
        page="reason"
      >{t`Reason`}</Dropdown.ActionItem>
      <Dropdown.ActionItem
        startIcon={<IconMailCog />}
        description={topicLabel}
        descriptionPlacement="end"
        page="topic"
      >{t`Topic`}</Dropdown.ActionItem>
      {hasActiveFilters && (
        <>
          <Dropdown.Separator />
          <Dropdown.ActionItem
            closeOnClick={false}
            color="danger"
            startIcon={<IconTrash />}
            onClick={onClear}
          >{t`Clear filters`}</Dropdown.ActionItem>
        </>
      )}
    </Dropdown.Section>
  );
};
