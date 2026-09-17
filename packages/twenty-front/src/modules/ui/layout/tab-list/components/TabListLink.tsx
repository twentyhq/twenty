import { Link, type LinkProps, useHref } from 'react-router-dom';
import { TabButton, type TabButtonProps } from 'twenty-ui/components';

type TabListLinkProps = Pick<
  TabButtonProps,
  | 'id'
  | 'className'
  | 'style'
  | 'ref'
  | 'disabled'
  | 'onClick'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'startIcon'
  | 'endIcon'
  | 'badge'
  | 'children'
  | 'active'
> & {
  'data-testid'?: string;
  'data-dnd-sortable-handle'?: boolean;
} & Pick<LinkProps, 'to' | 'state' | 'replace'>;

export const TabListLink = ({
  to,
  state,
  replace,
  active,
  id,
  className,
  style,
  ref,
  disabled,
  onClick,
  onMouseEnter,
  onMouseLeave,
  startIcon,
  endIcon,
  badge,
  children,
  'data-testid': testId,
  'data-dnd-sortable-handle': isDragHandle,
}: TabListLinkProps) => {
  const href = useHref(to);

  return (
    <TabButton
      id={id}
      className={className}
      style={style}
      ref={ref}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      startIcon={startIcon}
      endIcon={endIcon}
      badge={badge}
      children={children}
      data-testid={testId}
      data-dnd-sortable-handle={isDragHandle}
      active={active}
      aria-current={active ? 'page' : undefined}
      href={href}
      render={<Link to={to} state={state} replace={replace} />}
    />
  );
};
