import { CompanyProgressPicker } from '@/companies/components/CompanyProgressPicker';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { IconPlus } from '@/ui/display/icon/index';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { logError } from '~/utils/logError';

export const PipelineAddButton = () => {
  const { enqueueSnackBar } = useSnackBar();

  const { closeDropdown, toggleDropdown } = useDropdown({
    dropdownScopeId: 'add-pipeline-progress',
  });

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
    //createCompanyProgress(selectedCompany.id, selectedPipelineStageId);
  };

  return (
    <DropdownScope dropdownScopeId="add-pipeline-progress">
      <Dropdown
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
    </DropdownScope>
  );
};
