import { TextInputDropdownForm } from '@/advanced-text-editor/components/TextInputDropdownForm';
import { useSaveCurrentRecordFiltersAsRecordIndexTab } from '@/object-record/record-index-tab/hooks/useSaveCurrentRecordFiltersAsRecordIndexTab';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';

export const RecordIndexAddTabDropdown = () => {
  const { t } = useLingui();

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const dropdownId = `record-index-add-tab-${recordIndexId}`;

  const { closeDropdown } = useCloseDropdown();

  const { saveCurrentRecordFiltersAsNewRecordIndexTab } =
    useSaveCurrentRecordFiltersAsRecordIndexTab();

  const handleSubmit = async (name: string) => {
    const trimmedName = name.trim();

    if (!isNonEmptyString(trimmedName)) {
      return;
    }

    closeDropdown(dropdownId);
    await saveCurrentRecordFiltersAsNewRecordIndexTab(trimmedName);
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="panel">
      <Dropdown.Trigger
        render={
          <LightIconButton aria-label={t`Add tab`}>
            <IconPlus />
          </LightIconButton>
        }
      />
      <DropdownContent align="end" aria-label={t`Add tab`}>
        <Dropdown.Section>
          <TextInputDropdownForm
            defaultValue=""
            label={t`Tab name`}
            onSubmit={handleSubmit}
          />
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
