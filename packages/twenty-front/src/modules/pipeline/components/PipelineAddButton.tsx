import { OpportunityPicker } from '@/companies/components/OpportunityPicker';
import { useCreateOpportunity } from '@/object-record/record-board-deprecated/hooks/internal/useCreateOpportunity';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { IconPlus } from '@/ui/display/icon/index';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { logError } from '~/utils/logError';

export const PipelineAddButton = () => {
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
      enqueueSnackBar(
        'There was a problem with the company selection, please retry.',
        { variant: 'error' },
      );

      logError('There was a problem with the company selection, please retry.');
      return;
    }

    if (!selectedPipelineStepId) {
      enqueueSnackBar(
        'There was a problem with the pipeline stage selection, please retry.',
        { variant: 'error' },
      );

      logError('There was a problem with the pipeline step selection.');
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
