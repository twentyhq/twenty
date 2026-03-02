import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { SidePanelSubPageNavigationHeader } from '@/command-menu/pages/common/components/SidePanelSubPageNavigationHeader';

const StyledSubViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const StyledSearchContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  min-width: 0;
  padding-inline: ${({ theme }) => theme.spacing(3)};
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;

  padding: 0;
  width: 100%;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.tertiary};
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

type CommandMenuSubViewWithSearchProps = {
  backBarTitle: string;
  onBack: () => void;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  children?: ReactNode;
};

export const CommandMenuSubViewWithSearch = ({
  backBarTitle,
  onBack,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  searchInputProps,
  children,
}: CommandMenuSubViewWithSearchProps) => (
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
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...searchInputProps}
      />
    </StyledSearchContainer>
    {children != null && (
      <StyledScrollableListWrapper>{children}</StyledScrollableListWrapper>
    )}
  </StyledSubViewContainer>
);
