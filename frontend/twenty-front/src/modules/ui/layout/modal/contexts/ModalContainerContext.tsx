import { createContext, useContext } from 'react';

export type ModalContainerContextValue = {
  container: HTMLElement | null;
};

export const ModalContainerContext = createContext<ModalContainerContextValue>({
  container: null,
});

export const useModalContainer = () => {
  return useContext(ModalContainerContext);
};
