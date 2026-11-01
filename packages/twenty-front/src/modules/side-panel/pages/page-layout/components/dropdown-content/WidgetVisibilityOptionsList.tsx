import { VISIBILITY_OPTIONS } from '@/side-panel/pages/page-layout/constants/VisibilityOptions';
import { useVisibilityLabels } from '@/side-panel/pages/page-layout/hooks/useVisibilityLabels';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';

type WidgetVisibilityOptionsListProps = {
  currentOptionId: string;
  onSelectVisibility: (optionId: string) => void;
};

export const WidgetVisibilityOptionsList = ({
  currentOptionId,
  onSelectVisibility,
}: WidgetVisibilityOptionsListProps) => {
  const { t } = useLingui();
  const visibilityLabels = useVisibilityLabels();

  return (
    <Dropdown.Section>
      <Dropdown.SelectionGroup
        aria-label={t`Visibility restriction`}
        value={currentOptionId}
      >
        {VISIBILITY_OPTIONS.map((option) => (
          <Dropdown.OptionItem
            key={option.id}
            value={option.id}
            onSelect={() => onSelectVisibility(option.id)}
          >
            {visibilityLabels[option.id]}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.SelectionGroup>
    </Dropdown.Section>
  );
};
