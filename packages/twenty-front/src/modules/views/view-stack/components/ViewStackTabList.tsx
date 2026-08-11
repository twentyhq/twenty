import { styled } from '@linaria/react';
import { useContext } from 'react';

import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useOpenCreateViewDropdown } from '@/views/hooks/useOpenCreateViewDropown';
import { ViewStackActiveTab } from '@/views/view-stack/components/ViewStackActiveTab';
import { ViewStackTabButton } from '@/views/view-stack/components/ViewStackTabButton';
import { useViewStacks } from '@/views/view-stack/hooks/useViewStacks';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTabList = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ViewStackTabList = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const { viewStacks, activeViewStack, currentView } = useViewStacks();

  const { changeView } = useChangeView();
  const { openCreateViewDropdown } = useOpenCreateViewDropdown();

  const viewCount = viewStacks.reduce(
    (count, viewStack) => count + 1 + viewStack.childViews.length,
    0,
  );

  const handleAddStackClick = () => {
    openCreateViewDropdown(currentView);
  };

  return (
    <StyledTabList>
      {viewStacks.map((viewStack) =>
        viewStack.rootView.id === activeViewStack?.rootView.id ? (
          <ViewStackActiveTab
            key={viewStack.rootView.id}
            viewStack={viewStack}
            currentView={currentView}
            isLastView={viewCount <= 1}
          />
        ) : (
          <ViewStackTabButton
            key={viewStack.rootView.id}
            rootView={viewStack.rootView}
            isActive={false}
            onClick={() => changeView(viewStack.rootView.id)}
          />
        ),
      )}
      <StyledDropdownButtonContainer
        isUnfolded={false}
        onClick={handleAddStackClick}
        aria-label={t`Add stack`}
      >
        <IconPlus size={theme.icon.size.md} />
      </StyledDropdownButtonContainer>
    </StyledTabList>
  );
};
