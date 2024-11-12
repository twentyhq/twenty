import { createContext, useCallback, useState } from 'react';

export type DropdownContentContextValue<Key extends string = string> = {
  currentContentId: string | null;
  onContentChange: (key: Key) => void;
  resetContent: () => void;
};

export const DropdownContentContext =
  createContext<DropdownContentContextValue>({
    currentContentId: null,
    onContentChange: () => {},
    resetContent: () => {},
  });

type DropdownContentProviderProps = {
  children: React.ReactNode;
};

export const DropdownContentProvider = ({
  children,
}: DropdownContentProviderProps) => {
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);

  const handleContentChange = useCallback((key: string) => {
    setCurrentContentId(key);
  }, []);

  const handleResetContent = useCallback(() => {
    setCurrentContentId(null);
  }, []);

  return (
    <DropdownContentContext.Provider
      value={{
        currentContentId,
        onContentChange: handleContentChange,
        resetContent: handleResetContent,
      }}
    >
      {children}
    </DropdownContentContext.Provider>
  );
};
