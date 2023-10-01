import Link from "@docusaurus/Link";
import isInternalUrl from "@docusaurus/isInternalUrl";
import {
  Collapsible,
  ThemeClassNames,
  useCollapsible,
} from "@docusaurus/theme-common";
import { isActiveSidebarItem } from "@docusaurus/theme-common/internal";
import DocSidebarItems from "@theme/DocSidebarItems";
import IconExternalLink from "@theme/Icon/ExternalLink";
import clsx from "clsx";
import React from "react";
import * as icons from "../../icons";

const DocSidebarItemCategory = ({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}) => {
  const {
    href,
    label,
    className,
    collapsible,
    autoAddBaseUrl,
    customProps = {},
    items,
  } = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  const IconComponent = customProps?.icon ? icons[customProps.icon] : undefined;

  const { collapsed, setCollapsed } = useCollapsible({
    initialState: () => collapsible && !isActive && item.collapsed,
  });

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemCategory,
        ThemeClassNames.docs.docSidebarItemCategoryLevel(level),
        "menu__list-item",
        `menu__list-item--level${level}`,
        className
      )}
      key={label}
    >
      <Link
        className={clsx("menu__link", {
          "menu__link--active": isActive,
          "menu__link--external": !!href && !isInternalLink,
        })}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? "page" : undefined}
        aria-expanded={collapsible ? !collapsed : undefined}
        to={href}
        onClick={(e) => {
          onItemClick?.(item);

          if (!collapsible) return;

          if (href) {
            setCollapsed(false);
            return;
          }

          e.preventDefault();
          setCollapsed((previousCollapsed) => !previousCollapsed);
        }}
        {...props}
      >
        {IconComponent ? (
          <span className="icon-and-text">
            <i className="sidebar-item-icon">
              <IconComponent />
            </i>
            {label}
          </span>
        ) : (
          label
        )}

        {!!href && !isInternalLink && <IconExternalLink />}
      </Link>
      {!customProps.isSidebarRoot && (
        <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
          <DocSidebarItems
            items={items}
            tabIndex={collapsed ? -1 : 0}
            onItemClick={onItemClick}
            activePath={activePath}
            level={level + 1}
          />
        </Collapsible>
      )}
    </li>
  );
};

export default DocSidebarItemCategory;
