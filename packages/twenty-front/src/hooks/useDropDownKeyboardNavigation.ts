import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';

type DropDownKeyboardNavigationProps = {
  isDropDownOpen: boolean;
};

export const useDropDownKeyboardNavigation = ({
  isDropDownOpen,
}: DropDownKeyboardNavigationProps) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [totalDropDownMenuItems, setTotalDropDownMenuItems] =
    useState<number>(0);
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const dropDownMenuId = 'dropDownMenu';
  const dropdownMenu = document?.querySelector(`#${dropDownMenuId}`);

  const isDropDownMenuItemContainerDiv = (el: ChildNode) => {
    const element = el as HTMLElement;
    return element.tagName?.toLowerCase() === 'div';
  };

  const dropDownMenuItemContainerDiv = Array.from(
    dropdownMenu?.childNodes || [],
  ).find((el) => isDropDownMenuItemContainerDiv(el));

  // Calculate total number of items
  useEffect(() => {
    setTotalDropDownMenuItems(
      (dropdownMenu?.childNodes?.length || 0) -
        1 +
        (dropDownMenuItemContainerDiv?.childNodes[0].childNodes?.length || 0),
    );
  }, [
    dropDownMenuItemContainerDiv?.childNodes,
    dropdownMenu?.childNodes?.length,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setActiveIndex((prevIndex) =>
          prevIndex < totalDropDownMenuItems - 1 ? prevIndex + 1 : prevIndex,
        );
      } else if (e.key === 'ArrowUp') {
        setActiveIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex,
        );
      } else if (e.key === 'Enter') {
        if (activeElement) {
          activeElement.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    dropdownMenu?.childNodes,
    dropDownMenuItemContainerDiv?.childNodes,
    totalDropDownMenuItems,
    activeElement,
  ]);

  useEffect(() => {
    if (!isDropDownOpen) {
      setActiveIndex(0);
    }
  }, [isDropDownOpen]);

  useEffect(() => {
    const allDropDownMenuItems = [
      ...Array.from(dropdownMenu?.childNodes || []).filter(
        (el) => !isDropDownMenuItemContainerDiv(el),
      ),
      ...Array.from(
        dropDownMenuItemContainerDiv?.childNodes[0].childNodes || [],
      ),
    ];

    allDropDownMenuItems.forEach((element, index) => {
      const el = element as HTMLElement;
      // Manage focus and background color based on activeIndex
      if (index === activeIndex) {
        setActiveElement(el);
        if (el.tagName.toLowerCase() === 'input') {
          (el as HTMLInputElement).focus();
        } else {
          el.style.backgroundColor = theme.background.transparent.light;
        }
      } else {
        if (el.tagName?.toLowerCase() === 'input') {
          (el as HTMLInputElement).blur();
        } else {
          el.style.backgroundColor = theme.background.primary;
        }
      }
      el.addEventListener('mouseenter', () => {
        if (index !== activeIndex && el.tagName.toLowerCase() !== 'input') {
          el.style.backgroundColor = theme.background.transparent.light; 
        }
      });

      el.addEventListener('mouseleave', () => {
        if (index !== activeIndex) {
          el.style.backgroundColor = theme.background.primary; 
        }
      });
    });

    // Clean up event listeners when component unmounts or dependencies change
    return () => {
      allDropDownMenuItems.forEach((element) => {
        const el = element as HTMLElement;
        el.removeEventListener('mouseenter', () => {});
        el.removeEventListener('mouseleave', () => {});
      });
    };
  }, [
    dropdownMenu?.childNodes,
    dropDownMenuItemContainerDiv?.childNodes,
    totalDropDownMenuItems,
    activeIndex,
    theme.background.primary,
    theme.background.transparent.light,
  ]);

  return { dropDownMenuId };
};
