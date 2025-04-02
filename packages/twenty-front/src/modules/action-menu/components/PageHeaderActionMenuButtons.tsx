import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { i18n } from '@lingui/core';
import {
  AppTooltip,
  Button,
  IconButton,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui';

const StyledWrapper = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
`;

export const PageHeaderActionMenuButtons = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const pinnedEntries = actionMenuEntries.filter((entry) => entry.isPinned);

  return (
    <>
      {pinnedEntries.map((entry) =>
        entry.shortLabel ? (
          <Button
            key={entry.key}
            Icon={entry.Icon}
            size="small"
            variant="secondary"
            accent="default"
            title={entry.shortLabel ? i18n._(entry.shortLabel) : ''}
            onClick={() => entry.onClick?.()}
            ariaLabel={i18n._(entry.label)}
          />
        ) : (
          <div id={`action-menu-entry-${entry.key}`} key={entry.key}>
            <IconButton
              Icon={entry.Icon}
              size="small"
              variant="secondary"
              accent="default"
              onClick={() => entry.onClick?.()}
              ariaLabel={i18n._(entry.label)}
            />
            <StyledWrapper>
              <AppTooltip
                // eslint-disable-next-line
                anchorSelect={`#action-menu-entry-${entry.key}`}
                content={i18n._(entry.label)}
                delay={TooltipDelay.longDelay}
                place={TooltipPosition.Bottom}
                offset={5}
                noArrow
              />
            </StyledWrapper>
          </div>
        ),
      )}
    </>
  );
};
