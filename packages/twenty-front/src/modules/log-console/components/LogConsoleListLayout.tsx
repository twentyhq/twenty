import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { SearchInput } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { LogConsoleToolbarLayout } from '@/log-console/components/LogConsoleToolbarLayout';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledSearch = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledContent = styled.div`
  box-sizing: border-box;
  padding: 0 ${themeCssVariables.spacing[3]};
  width: 100%;
`;

type LogConsoleListLayoutProps = {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (searchValue: string) => void;
  actions: ReactNode;
  scrollWrapperInstanceId: string;
  children: ReactNode;
};

export const LogConsoleListLayout = ({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  actions,
  scrollWrapperInstanceId,
  children,
}: LogConsoleListLayoutProps) => (
  <>
    <LogConsoleToolbarLayout actions={actions}>
      <StyledSearch>
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onValueChange={onSearchChange}
        />
      </StyledSearch>
    </LogConsoleToolbarLayout>
    <ScrollWrapper componentInstanceId={scrollWrapperInstanceId}>
      <StyledContent>{children}</StyledContent>
    </ScrollWrapper>
  </>
);
