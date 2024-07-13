import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';

type DropDownKeyboardNavigationProps = {
  isDropDownOpen: boolean;
};
export const useDropDownKeyboardNavigation = ({
  isDropDownOpen,
}: DropDownKeyboardNavigationProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const dropDownMenuId = 'dropDownMenu';
  const dropdownMenu = document?.querySelector(`#${dropDownMenuId}`);

  // Function to determine if an element is a container div
  const isDropDownMenuItemContainerDiv = (el: ChildNode) =>
    el?.childNodes[0]?.childNodes?.length > 1;

  // Find the container div element
  const dropDownMenuItemContainerDiv = Array.from(
    dropdownMenu?.childNodes || [],
  ).find((el) => isDropDownMenuItemContainerDiv(el));

  // Calculate total number of items
  const totalDropDownMenuItems =
    (dropdownMenu?.childNodes?.length || 0) -
    1 +
    (dropDownMenuItemContainerDiv?.childNodes[0].childNodes?.length || 0);
  const theme = useTheme()
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
        el.style.backgroundColor = theme.background.transparent.primary;
  
        if (el.tagName.toLowerCase() === 'input') {
          (el as HTMLInputElement).focus();
        }
      } else {
        el.style.backgroundColor = theme.background.primary; // Reset to default or transparent
      }
  
      // Blur input elements when they are not focused
      if (el.tagName.toLowerCase() === 'input' && index !== activeIndex) {
        (el as HTMLInputElement).blur();
      }
  
      // Handle hover effect
      el.addEventListener('mouseenter', () => {
        if (index !== activeIndex) {
          el.style.backgroundColor = theme.background.transparent.primary; // Change to hover color
        }
      });
  
      el.addEventListener('mouseleave', () => {
        if (index !== activeIndex) {
          el.style.backgroundColor = theme.background.primary; // Reset to default or transparent
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
  ]);
  

  return { dropDownMenuId };
};
