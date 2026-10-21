import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { fieldsWidgetEditingFieldMetadataIdComponentState } from '@/page-layout/states/fieldsWidgetEditingFieldMetadataIdComponentState';
import { useUpdateFieldConditionalDisplayInDraft } from '@/page-layout/widgets/fields/hooks/useUpdateFieldConditionalDisplayInDraft';
import { getFieldsConfigurationFieldVisibilityIcon } from '@/page-layout/widgets/fields/utils/getFieldsConfigurationFieldVisibilityIcon';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconEye, IconEyeOff, IconFilter } from 'twenty-ui/icon';

type FieldsConfigurationFieldVisibilityDropdownProps = {
  fieldMetadataItem: FieldMetadataItem;
  isVisible: boolean;
  hasConditionalDisplay: boolean;
  onToggleVisibility: () => void;
};

export const FieldsConfigurationFieldVisibilityDropdown = ({
  fieldMetadataItem,
  isVisible,
  hasConditionalDisplay,
  onToggleVisibility,
}: FieldsConfigurationFieldVisibilityDropdownProps) => {
  const { t } = useLingui();

  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updateFieldConditionalDisplay } =
    useUpdateFieldConditionalDisplayInDraft({
      pageLayoutId,
      widgetId: widgetInEditMode?.id ?? '',
    });

  const setFieldsWidgetEditingFieldMetadataId = useSetAtomComponentState(
    fieldsWidgetEditingFieldMetadataIdComponentState,
    pageLayoutId,
  );

  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const VisibilityIcon = getFieldsConfigurationFieldVisibilityIcon({
    isVisible,
    hasConditionalDisplay,
  });

  const isHidden = !isVisible;

  const handleVisibleSelect = () => {
    if (isHidden) {
      onToggleVisibility();
    }

    updateFieldConditionalDisplay(fieldMetadataItem.id, null);
  };

  const handleHiddenSelect = () => {
    if (!isHidden) {
      onToggleVisibility();
    }

    updateFieldConditionalDisplay(fieldMetadataItem.id, null);
  };

  const handleCustomRuleSelect = () => {
    if (isHidden) {
      onToggleVisibility();
    }

    setFieldsWidgetEditingFieldMetadataId(fieldMetadataItem.id);

    const fieldLabel = fieldMetadataItem.label;

    navigateToSidePanelSubPage(
      SidePanelSubPages.PageLayoutFieldVisibility,
      t`${fieldLabel} · Visibility`,
    );
  };

  return (
    <DropdownRoot
      dropdownId={`fields-configuration-field-visibility-${fieldMetadataItem.id}`}
      type="menu"
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={t`Field visibility`}
            onClick={(event) => event.stopPropagation()}
          >
            <VisibilityIcon />
          </LightIconButton>
        }
      />
      <DropdownContent align="end">
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconEye />}
            onClick={handleVisibleSelect}
          >{t`Visible`}</Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconEyeOff />}
            onClick={handleHiddenSelect}
          >{t`Hidden`}</Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconFilter />}
            hasSubmenu
            onClick={handleCustomRuleSelect}
          >{t`Custom rule`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
