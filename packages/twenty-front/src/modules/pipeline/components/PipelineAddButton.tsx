import { OpportunityPicker } from '@/companies/components/OpportunityPicker';
import { useCreateOpportunity } from '@/object-record/record-board/hooks/internal/useCreateOpportunity';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { IconPlus } from '@/ui/display/icon/index';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import useI18n from '@/ui/i18n/useI18n';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { logError } from '~/utils/logError';

export const PipelineAddButton = () => {
  const { translate } = useI18n('translations');
  const { enqueueSnackBar } = useSnackBar();

  const { closeDropdown, toggleDropdown } = useDropdown(
    'add-pipeline-progress',
  );

  const createOpportunity = useCreateOpportunity();

  const handleCompanySelected = (
    selectedCompany: EntityForSelect | null,
    selectedPipelineStepId: string | null,
  ) => {
    if (!selectedCompany?.id) {
      enqueueSnackBar(translate('problemWithCompany'), { variant: 'error' });

      logError(translate('problemWithCompany'));
      return;
    }

    if (!selectedPipelineStepId) {
      enqueueSnackBar(translate('problemWithPipeline'), { variant: 'error' });

      logError(translate('problemWithPipelineStepSelection'));
      return;
    }
    closeDropdown();
    createOpportunity(selectedCompany.id, selectedPipelineStepId);
  };

  return (
    <Dropdown
      dropdownId="add-pipeline-progress"
      clickableComponent={
        <IconButton
          Icon={IconPlus}
          size="medium"
          dataTestId="add-company-progress-button"
          accent="default"
          variant="secondary"
          onClick={toggleDropdown}
        />
      }
      dropdownComponents={
        <OpportunityPicker
          companyId={null}
          onSubmit={handleCompanySelected}
          onCancel={closeDropdown}
        />
      }
      hotkey={{
        key: 'c',
        scope: PageHotkeyScope.OpportunitiesPage,
      }}
      dropdownHotkeyScope={{
        scope: RelationPickerHotkeyScope.RelationPicker,
      }}
    />
  );
};
