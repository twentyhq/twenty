import { useCallback } from 'react';

export const useScrollToElement = () => {
  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    
    if (element !== null) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return true;
    }
    return false;
  }, []);

  return { scrollToElement };
}; 