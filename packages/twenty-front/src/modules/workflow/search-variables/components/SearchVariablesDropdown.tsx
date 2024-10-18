import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SearchVariablesDropdownStepItem } from '@/workflow/search-variables/components/SearchVariablesDropdownStepItem';
import SearchVariablesDropdownStepSubItem from '@/workflow/search-variables/components/SearchVariablesDropdownStepSubItem';
import { SEARCH_VARIABLES_DROPDOWN_ID } from '@/workflow/search-variables/constants/SearchVariablesDropdownId';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconVariable } from 'twenty-ui';

export type Step = {
  id: string;
  name: string;
  output: any;
};

const MOCK_AVAILABLE_VARIABLES: Step[] = [
  {
    id: '1',
    name: 'Person is Created',
    output: {
      userId: '1',
      recordId: '123',
      objectMetadataItem: {
        id: '1234',
        nameSingular: 'person',
        namePlural: 'people',
      },
      properties: {
        after: {
          name: 'John Doe',
          email: 'john.doe@email.com',
        },
      },
    },
  },
  {
    id: '2',
    name: 'Send Email',
    output: {
      success: true,
    },
  },
];

const StyledDropdownVariableButtonContainer = styled(
  StyledDropdownButtonContainer,
)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const SearchVariablesDropdown = ({
  onSelect,
}: {
  onSelect: (value: any) => void;
}) => {
  const theme = useTheme();

  const { isDropdownOpen } = useDropdown(SEARCH_VARIABLES_DROPDOWN_ID);
  const [selectedStep, setSelectedStep] = useState<Step | undefined>(undefined);

  const handleStepSelect = (stepId: string) => {
    setSelectedStep(
      MOCK_AVAILABLE_VARIABLES.find((step) => step.id === stepId),
    );
  };

  const handleSubItemSelect = (subItem: string) => {
    onSelect(subItem);
  };

  const handleBack = () => {
    setSelectedStep(undefined);
  };

  return (
    <Dropdown
      dropdownId={SEARCH_VARIABLES_DROPDOWN_ID}
      dropdownHotkeyScope={{
        scope: SEARCH_VARIABLES_DROPDOWN_ID,
      }}
      clickableComponent={
        <StyledDropdownVariableButtonContainer isUnfolded={isDropdownOpen}>
          <IconVariable size={theme.icon.size.sm} />
        </StyledDropdownVariableButtonContainer>
      }
      dropdownComponents={
        <DropdownMenu style={{ zIndex: 2001 }}>
          <DropdownMenuItemsContainer>
            {selectedStep ? (
              <SearchVariablesDropdownStepSubItem
                step={selectedStep}
                onSelect={handleSubItemSelect}
                onBack={handleBack}
              />
            ) : (
              <SearchVariablesDropdownStepItem
                steps={MOCK_AVAILABLE_VARIABLES}
                onSelect={handleStepSelect}
              />
            )}
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
      dropdownPlacement="bottom-end"
      dropdownOffset={{ x: 0, y: 4 }}
    />
  );
};

export default SearchVariablesDropdown;
