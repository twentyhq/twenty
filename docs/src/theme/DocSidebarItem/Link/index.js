import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/theme-common/internal';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import styles from './styles.module.css';
import { 
  TbFaceIdError,
  TbTerminal2,
  TbCloud,
  TbServer,
  TbBolt,
  TbApps,
  TbTopologyStar,
  TbChartDots, 
  TbBug,
  TbVocabulary,
  TbArrowBigRight,
  TbDeviceDesktop,
  TbBrandWindows,
  TbBugOff,
  TbBrandVscode,
  TbFolder,
} from "react-icons/tb";


export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}) {
  const {href, label, className, autoAddBaseUrl, customProps = {}} = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  let icons = {
    'TbTerminal2': TbTerminal2,
    'TbCloud': TbCloud,
    'TbArrowBigRight': TbArrowBigRight,
    'TbServer': TbServer,
    'TbBolt': TbBolt,
    'TbApps': TbApps,
    'TbTopologyStar': TbTopologyStar,
    'TbChartDots': TbChartDots,
    'TbBug': TbBug,
    'TbVocabulary': TbVocabulary,
    'TbBrandWindows': TbBrandWindows,
    'TbBugOff': TbBugOff,
    'TbBrandVscode': TbBrandVscode,
    'TbDeviceDesktop': TbDeviceDesktop,
    'TbFolder': TbFolder,
  };

  let IconComponent = customProps && customProps.icon ? icons[customProps.icon] : TbFaceIdError;
  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className,
      )}
      key={label}>
      <Link
        className={clsx(
          'menu__link',
          !isInternalLink && styles.menuExternalLink,
          {
            'menu__link--active': isActive,
          },
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}>
        <span className="icon-and-text">
          <i className="sidebar-item-icon">
            <IconComponent />
          </i>
          {label}
        </span>
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
