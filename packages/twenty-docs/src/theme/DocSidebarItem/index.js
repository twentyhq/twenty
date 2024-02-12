import React from 'react';
import { TbSearch } from 'react-icons/tb';
import DocSidebarItem from '@theme-original/DocSidebarItem';
import SearchBar from '@theme-original/SearchBar';

const CustomComponents = {
  'search-bar': () => {
    const openSearchModal = () => {
      console.log('yo');

      const searchInput = document.querySelector('#search-bar');
      if (searchInput) {
        searchInput.focus();
      }

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        code: 'KeyK',
        keyCode: 75,
        which: 75,
        // If the shortcut is Cmd+K on Mac or Ctrl+K on Windows/Linux, set the respective key to true:
        metaKey: true, // for Cmd+K (Mac)
        // ctrlKey: true, // for Ctrl+K (Windows/Linux)
        bubbles: true,
      });

      // Dispatch the event
      window.dispatchEvent(event);
    };

    return (
      <>
        <li className="theme-doc-sidebar-item-category theme-doc-sidebar-item-category-level-2 menu__list-item menu__list-item--level2 search-menu-item">
          <SearchBar style={{ display: 'none' }} />
          <a className="menu__link" onClick={openSearchModal}>
            <span className="icon-and-text">
              <i className="sidebar-item-icon">
                <TbSearch />
              </i>
              Search
            </span>
            <span
              className="DocSearch-Button-Keys"
              style={{ paddingLeft: '10px', display: 'none' }}
            >
              <kbd className="DocSearch-Button-Key">⌘</kbd>
              <kbd className="DocSearch-Button-Key">K</kbd>
            </span>
          </a>
        </li>
      </>
    );
  },
};

export default function DocSidebarItemWrapper(props) {
  const CustomComponent = CustomComponents[props.item?.customProps?.type];
  if (CustomComponent) {
    return <CustomComponent {...props.item?.customProps?.props} />;
  }

  return (
    <>
      <DocSidebarItem {...props} />
    </>
  );
}
