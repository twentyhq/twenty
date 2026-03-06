import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { SidePanelSubPageNavigationHeader } from '@/side-panel/pages/common/components/SidePanelSubPageNavigationHeader';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSubViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const StyledSearchContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  height: ${themeCssVariables.spacing[10]};
  min-width: 0;
  padding-inline: ${themeCssVariables.spacing[3]};
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;

  padding: 0;
  width: 100%;
  outline: none;

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledScrollableListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  & > * {
    flex: 1;
    min-height: 0;
  }
`;

type SidePanelSubViewWithSearchProps = {
  backBarTitle: string;
  onBack: () => void;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  children?: ReactNode;
};

export const SidePanelSubViewWithSearch = ({
  backBarTitle,
  onBack,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  searchInputProps,
  children,
}: SidePanelSubViewWithSearchProps) => (
  <StyledSubViewContainer>
    <SidePanelSubPageNavigationHeader
      title={backBarTitle}
      onBackClick={onBack}
    />
    <StyledSearchContainer>
      <StyledSearchInput
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        autoFocus
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...searchInputProps}
      />
    </StyledSearchContainer>
    {children != null && (
      <StyledScrollableListWrapper>{children}</StyledScrollableListWrapper>
    )}
  </StyledSubViewContainer>
);
