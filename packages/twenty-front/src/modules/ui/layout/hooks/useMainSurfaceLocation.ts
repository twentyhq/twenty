import { useContext } from 'react';
import { useLocation } from 'react-router-dom';

import { MainSurfaceLocationContext } from '@/ui/layout/contexts/MainSurfaceLocationContext';

// A routed side panel page reads its own path from the router, so it gets
// the main page's location from context
export const useMainSurfaceLocation = () => {
  const location = useLocation();
  const mainSurfaceLocation = useContext(MainSurfaceLocationContext);

  return mainSurfaceLocation ?? location;
};
