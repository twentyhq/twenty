import { CompanyProgressPicker } from '@/companies/components/CompanyProgressPicker';
import { useCreateCompanyProgress } from '@/companies/hooks/useCreateCompanyProgress';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { ViewBarDropdownButton } from '@/ui/Data/View Bar/components/ViewBarDropdownButton';
import { IconPlus } from '@/ui/Display/Icon/index';
import { useSnackBar } from '@/ui/Feedback/Snack Bar/hooks/useSnackBar';
import { IconButton } from '@/ui/Input/Button/components/IconButton';
import { EntityForSelect } from '@/ui/Input/Relation Picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/ui/Input/Relation Picker/types/RelationPickerHotkeyScope';
import { useDropdown } from '@/ui/Layout/Dropdown/hooks/useDropdown';
import { logError } from '~/utils/logError';

export const PipelineAddButton = () => {
  const { enqueueSnackBar } = useSnackBar();

  const { closeDropdown, toggleDropdown } = useDropdown({
    dropdownScopeId: 'add-pipeline-progress',
  });

  const createCompanyProgress = useCreateCompanyProgress();

  const handleCompanySelected = (
    selectedCompany: EntityForSelect | null,
    selectedPipelineStageId: string | null,
  ) => {
    if (!selectedCompany?.id) {
      enqueueSnackBar(
        'There was a problem with the company selection, please retry.',
        {
          variant: 'error',
        },
      );

      logError('There was a problem with the company selection, please retry.');
      return;
    }

    if (!selectedPipelineStageId) {
      enqueueSnackBar(
        'There was a problem with the pipeline stage selection, please retry.',
        {
          variant: 'error',
        },
      );

      logError('There was a problem with the pipeline stage selection.');
      return;
    }
    closeDropdown();
    createCompanyProgress(selectedCompany.id, selectedPipelineStageId);
  };

  return (
    <ViewBarDropdownButton
      dropdownId="add-pipeline-progress"
      buttonComponent={
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
        <CompanyProgressPicker
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
