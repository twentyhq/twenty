import { CompanyProgressPicker } from '@/companies/components/CompanyProgressPicker';
import { useCreateCompanyProgress } from '@/companies/hooks/useCreateCompanyProgress';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { IconButton } from '@/ui/button/components/IconButton';
import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';
import { IconPlus } from '@/ui/icon/index';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { ViewBarDropdownButton } from '@/ui/view-bar/components/ViewBarDropdownButton';
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
