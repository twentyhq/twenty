import { CompanyProgressPicker } from '@/companies/components/CompanyProgressPicker';
import { useCreateCompanyProgress } from '@/companies/hooks/useCreateCompanyProgress';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconPlus } from '@/ui/icon/index';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';

export function PipelineAddButton() {
  const { enqueueSnackBar } = useSnackBar();

  const { closeDropdownButton } = useDropdownButton();

  const createCompanyProgress = useCreateCompanyProgress();

  function handleCompanySelected(
    selectedCompany: EntityForSelect | null,
    selectedPipelineStageId: string | null,
  ) {
    if (!selectedCompany?.id) {
      enqueueSnackBar(
        'There was a problem with the company selection, please retry.',
        {
          variant: 'error',
        },
      );

      console.error(
        'There was a problem with the company selection, please retry.',
      );
      return;
    }

    if (!selectedPipelineStageId) {
      enqueueSnackBar(
        'There was a problem with the pipeline stage selection, please retry.',
        {
          variant: 'error',
        },
      );

      console.error('There was a problem with the pipeline stage selection.');
      return;
    }

    createCompanyProgress(selectedCompany.id, selectedPipelineStageId);
  }

  return (
    <DropdownButton
      buttonComponents={
        <IconButton
          icon={<IconPlus size={16} />}
          size="large"
          data-testid="add-company-progress-button"
          textColor={'secondary'}
          variant="border"
        />
      }
      dropdownComponents={
        <CompanyProgressPicker
          companyId={null}
          onSubmit={handleCompanySelected}
          onCancel={closeDropdownButton}
        />
      }
      hotkey={{
        key: 'c',
        scope: PageHotkeyScope.OpportunitiesPage,
      }}
      dropdownScopeToSet={{
        scope: RelationPickerHotkeyScope.RelationPicker,
      }}
    />
  );
}
