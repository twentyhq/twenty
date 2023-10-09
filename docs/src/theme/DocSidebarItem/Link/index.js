import Link from "@docusaurus/Link";
import isInternalUrl from "@docusaurus/isInternalUrl";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { isActiveSidebarItem } from "@docusaurus/theme-common/internal";
import IconExternalLink from "@theme/Icon/ExternalLink";
import clsx from "clsx";
import React from "react";
import * as icons from "../../icons";

const DocSidebarItemLink = ({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}) => {
  const { href, label, className, autoAddBaseUrl, customProps = {} } = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  const IconComponent = customProps?.icon ? icons[customProps.icon] : null;

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        "menu__list-item",
        `menu__list-item--level${level}`,
        { "menu__list-item--root": customProps.isSidebarRoot },
        className
      )}
      key={label}
    >
      <Link
        className={clsx("menu__link", {
          "menu__link--active": isActive,
          "menu__link--external": !isInternalLink,
        })}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? "page" : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}
      >
        <span className="icon-and-text">
        {IconComponent && (
          <i className="sidebar-item-icon">
            <IconComponent size={customProps.iconSize} />
          </i>
        )}
          {label}
        </span>
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
};

export default DocSidebarItemLink;
