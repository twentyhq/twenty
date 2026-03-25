import React from 'react';
import type { Box, Text, Static } from 'ink';

type InkComponents = {
  Box: typeof Box;
  Text: typeof Text;
  Static: typeof Static;
};

const InkContext = React.createContext<InkComponents | null>(null);

export const InkProvider = InkContext.Provider;

export const useInk = (): InkComponents => {
  const context = React.useContext(InkContext);

  if (!context) {
    throw new Error('useInk must be used within InkProvider');
  }

  return context;
};
