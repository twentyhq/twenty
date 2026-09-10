import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { useGetNewFieldDefaultVisibility } from '@/page-layout/widgets/fields/hooks/useGetNewFieldDefaultVisibility';
import { useUpdateNewFieldDefaultVisibility } from '@/page-layout/widgets/fields/hooks/useUpdateNewFieldDefaultVisibility';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { IconEye } from 'twenty-ui/icon';

export const NewFieldDefaultVisibilitySwitch = ({
  pageLayoutId,
  widgetId,
}: {
  pageLayoutId: string;
  widgetId: string;
}) => {
  const { t } = useLingui();

  const { newFieldDefaultVisibility } = useGetNewFieldDefaultVisibility({
    pageLayoutId,
    widgetId,
  });

  const { updateNewFieldDefaultVisibility } =
    useUpdateNewFieldDefaultVisibility({
      pageLayoutId,
      widgetId,
    });

  const handleToggle = () => {
    updateNewFieldDefaultVisibility(!newFieldDefaultVisibility);
  };

  return (
    <SelectableListItem
      itemId="new-field-default-visibility"
      onEnter={handleToggle}
    >
      <CommandMenuItemSwitch
        LeftIcon={IconEye}
        text={t`Set fields created in the future as "visible"`}
        id="new-field-default-visibility"
        toggled={newFieldDefaultVisibility}
        onToggleChange={handleToggle}
      />
    </SelectableListItem>
  );
};
