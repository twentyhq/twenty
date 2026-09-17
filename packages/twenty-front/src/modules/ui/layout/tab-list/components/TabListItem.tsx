import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useLocation } from 'react-router-dom';
import { TabButton } from 'twenty-ui/components';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { NavigationLink } from '@/ui/input/components/NavigationLink';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { type TabListItemProps } from '@/ui/layout/tab-list/types/TabListItemProps';
import { getTabListItemContent } from '@/ui/layout/tab-list/utils/getTabListItemContent';

const TAB_ELEMENT_ID_PREFIX = 'tab-';

const StyledTooltipAnchor = styled.div`
  display: flex;
`;

export const TabListItem = ({
  tab,
  active,
  mode,
  disabled = tab.disabled,
  highlighted,
  onSelect,
  ref,
  'data-dnd-sortable-handle': isDragHandle,
  onMouseEnter,
  onMouseLeave,
}: TabListItemProps) => {
  const location = useLocation();
  const workspaceSurface = useWorkspaceSurface();
  const { startIcon, badge } = getTabListItemContent(tab);
  const elementId = `${TAB_ELEMENT_ID_PREFIX}${tab.id}`;
  const selectTab = () => onSelect?.(tab.id);

  return (
    <Tooltip
      content={tab.tooltipContent}
      disabled={!isNonEmptyString(tab.tooltipContent)}
      side="bottom"
      positionMethod="fixed"
      delay={300}
    >
      <StyledTooltipAnchor>
        {mode === 'tab' ? (
          <Tabs.Tab
            id={elementId}
            data-testid={elementId}
            value={tab.id}
            ref={ref}
            data-dnd-sortable-handle={isDragHandle}
            disabled={disabled}
            highlighted={highlighted}
            startIcon={startIcon}
            badge={badge}
            onClick={active ? selectTab : undefined}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {tab.title}
          </Tabs.Tab>
        ) : (
          <NavigationLink
            to={{ search: location.search, hash: `#${tab.id}` }}
            state={location.state}
            replace={workspaceSurface.type === 'side-panel'}
          >
            {({ href, render }) => (
              <TabButton
                id={elementId}
                data-testid={elementId}
                ref={ref}
                href={href}
                render={render}
                active={active}
                aria-current={active ? 'page' : undefined}
                disabled={disabled}
                startIcon={startIcon}
                badge={badge}
                onClick={selectTab}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                {tab.title}
              </TabButton>
            )}
          </NavigationLink>
        )}
      </StyledTooltipAnchor>
    </Tooltip>
  );
};
