import { styled } from '@linaria/react';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { TabButton } from 'twenty-ui/components';
import { Avatar, Pill } from 'twenty-ui/primitives/data-display';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { TabListLink } from './TabListLink';
import { type TabListButtonProps } from '../types/TabListButtonProps';

const TAB_ELEMENT_ID_PREFIX = 'tab-';

const StyledTooltipAnchor = styled.div`
  display: flex;
`;

export const TabListButton = ({
  id,
  title,
  active,
  asTab = false,
  disabled,
  LeftIcon,
  RightIcon,
  logo,
  pill,
  to,
  state,
  replace,
  className,
  style,
  ref,
  'data-dnd-sortable-handle': isDragHandle,
  disableTestId = false,
  tooltipContent,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: TabListButtonProps) => {
  const hasLeadingContent = isDefined(LeftIcon) || isNonEmptyString(logo);

  const tabElementId = disableTestId
    ? undefined
    : `${TAB_ELEMENT_ID_PREFIX}${id}`;

  const startIcon = hasLeadingContent ? (
    <>
      {isDefined(LeftIcon) && <LeftIcon />}
      {isNonEmptyString(logo) && (
        <Avatar src={logo} size="md" name={title} aria-hidden />
      )}
    </>
  ) : undefined;
  const endIcon = isDefined(RightIcon) ? <RightIcon /> : undefined;
  const badge = isString(pill) ? <Pill label={pill} /> : pill;

  const renderButton = () => {
    if (asTab) {
      return (
        <Tabs.Tab
          id={tabElementId}
          data-testid={tabElementId}
          className={className}
          style={style}
          ref={ref}
          data-dnd-sortable-handle={isDragHandle}
          disabled={disabled}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          startIcon={startIcon}
          endIcon={endIcon}
          badge={badge}
          children={title}
          value={id}
          onClick={active ? onClick : undefined}
        />
      );
    }

    if (isDefined(to)) {
      return (
        <TabListLink
          id={tabElementId}
          data-testid={tabElementId}
          className={className}
          style={style}
          ref={ref}
          data-dnd-sortable-handle={isDragHandle}
          disabled={disabled}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          startIcon={startIcon}
          endIcon={endIcon}
          badge={badge}
          children={title}
          to={to}
          state={state}
          replace={replace}
          active={active}
          onClick={onClick}
        />
      );
    }

    return (
      <TabButton
        id={tabElementId}
        data-testid={tabElementId}
        className={className}
        style={style}
        ref={ref}
        data-dnd-sortable-handle={isDragHandle}
        disabled={disabled}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        startIcon={startIcon}
        endIcon={endIcon}
        badge={badge}
        children={title}
        active={active}
        onClick={onClick}
      />
    );
  };

  return (
    <Tooltip
      content={tooltipContent}
      disabled={!isNonEmptyString(tooltipContent)}
      side="bottom"
      positionMethod="fixed"
      delay={300}
    >
      <StyledTooltipAnchor>{renderButton()}</StyledTooltipAnchor>
    </Tooltip>
  );
};
