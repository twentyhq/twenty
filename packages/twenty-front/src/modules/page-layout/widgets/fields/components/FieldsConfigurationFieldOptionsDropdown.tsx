import { getConditionalDisplaySummaryLabel } from '@/conditional-display/utils/getConditionalDisplaySummaryLabel';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { fieldsWidgetEditingFieldMetadataIdComponentState } from '@/page-layout/states/fieldsWidgetEditingFieldMetadataIdComponentState';
import { getFieldsConfigurationFieldOptionsDropdownId } from '@/page-layout/widgets/fields/utils/getFieldsConfigurationFieldOptionsDropdownId';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { type ConditionalDisplay } from 'twenty-shared/types';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconEyeX } from 'twenty-ui/icon';

type FieldsConfigurationFieldOptionsDropdownProps = {
  fieldMetadataItem: FieldMetadataItem;
  conditionalDisplay: ConditionalDisplay | null | undefined;
};

export const FieldsConfigurationFieldOptionsDropdown = ({
  fieldMetadataItem,
  conditionalDisplay,
}: FieldsConfigurationFieldOptionsDropdownProps) => {
  const { t } = useLingui();

  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const setFieldsWidgetEditingFieldMetadataId = useSetAtomComponentState(
    fieldsWidgetEditingFieldMetadataIdComponentState,
    pageLayoutId,
  );

  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const handleOpenVisibility = () => {
    setFieldsWidgetEditingFieldMetadataId(fieldMetadataItem.id);
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutFieldVisibility);
  };

  return (
    <DropdownRoot
      dropdownId={getFieldsConfigurationFieldOptionsDropdownId(
        fieldMetadataItem.id,
      )}
      type="menu"
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={t`More options`}
            onClick={(event) => event.stopPropagation()}
          >
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent align="end">
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconEyeX />}
            hasSubmenu
            description={getConditionalDisplaySummaryLabel({
              conditionName: 'conditionalDisplay',
              conditionalDisplay,
            })}
            descriptionPlacement="end"
            onClick={handleOpenVisibility}
          >{t`Visibility restriction`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
