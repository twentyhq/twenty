import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
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

export const ActionButton = ({ action }: { action: ActionDisplayProps }) => {
  return (
    <>
      {action.shortLabel ? (
        <Button
          key={action.key}
          Icon={action.Icon}
          size="small"
          variant="secondary"
          accent="default"
          onClick={action.onClick}
          title={action.shortLabel ? i18n._(action.shortLabel) : ''}
          ariaLabel={i18n._(action.label)}
        />
      ) : (
        <div id={`action-menu-entry-${action.key}`} key={action.key}>
          <IconButton
            Icon={action.Icon}
            size="small"
            variant="secondary"
            accent="default"
            onClick={action.onClick}
            ariaLabel={i18n._(action.label)}
          />
          <StyledWrapper>
            <AppTooltip
              // eslint-disable-next-line
              anchorSelect={`#action-menu-entry-${action.key}`}
              content={i18n._(action.label)}
              delay={TooltipDelay.longDelay}
              place={TooltipPosition.Bottom}
              offset={5}
              noArrow
            />
          </StyledWrapper>
        </div>
      )}
    </>
  );
};
