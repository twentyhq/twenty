import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconLibraryPlus, IconPlus } from 'twenty-ui/icon';

type ConditionBuilderAddRuleMenuProps = {
  onAddRule: () => void;
} & (
  | { canAddGroup: true; dropdownId: string; onAddGroup: () => void }
  | { canAddGroup: false }
);

export const ConditionBuilderAddRuleMenu = (
  props: ConditionBuilderAddRuleMenuProps,
) => {
  const { onAddRule } = props;
  const { t } = useLingui();

  if (!props.canAddGroup) {
    return (
      <CommandMenuButton
        command={{
          Icon: IconPlus,
          label: t`Add rule`,
          shortLabel: t`Add rule`,
          key: 'add-rule',
        }}
        onClick={onAddRule}
      />
    );
  }

  return (
    <DropdownRoot dropdownId={props.dropdownId} type="menu">
      <Dropdown.Trigger
        render={
          <NavigationButton
            size="sm"
            variant="outline"
            color="neutral"
            startIcon={<IconPlus />}
            aria-label={t`Add filter rule`}
          >
            {t`Add filter rule`}
          </NavigationButton>
        }
      />
      <DropdownContent>
        <Dropdown.Section>
          <Dropdown.ActionItem startIcon={<IconPlus />} onClick={onAddRule}>
            {t`Add rule`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconLibraryPlus />}
            onClick={props.onAddGroup}
          >
            {t`Add rule group`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
