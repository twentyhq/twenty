import { type SidePanelEditColumnShowSelectEntry } from '@/side-panel/pages/edit-column/types/SidePanelEditColumnShowSelectEntry';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';

type SidePanelEditColumnShowSelectSubPageProps = {
  entry: SidePanelEditColumnShowSelectEntry;
  value: string | null;
  onChange: (value: string | null) => void;
};

export const SidePanelEditColumnShowSelectSubPage = ({
  entry,
  value,
  onChange,
}: SidePanelEditColumnShowSelectSubPageProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  return (
    <Dropdown.Page id={entry.id}>
      <Dropdown.Back aria-label={t`${entry.label}, back`}>
        {entry.label}
      </Dropdown.Back>
      <Dropdown.Section scrollable={false}>
        <Dropdown.OptionItem
          selected={entry.value === value}
          indicator="check"
          onSelect={() => onChange(entry.value)}
          startIcon={<SelectOptionIcon Icon={getIcon(entry.icon)} />}
        >
          {entry.label}
        </Dropdown.OptionItem>
      </Dropdown.Section>
      <Dropdown.Separator />
      <Dropdown.Section scrollable={false}>
        {entry.summaryShowOptions.map((summaryShowOption) => (
          <Dropdown.OptionItem
            key={summaryShowOption.value}
            selected={summaryShowOption.value === value}
            indicator="check"
            onSelect={() => onChange(summaryShowOption.value)}
          >
            {summaryShowOption.operationLabel}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </Dropdown.Page>
  );
};
