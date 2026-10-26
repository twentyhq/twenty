import { type PageCommand } from '@/command-menu-item/page-command/types/PageCommand';
import { contextStorePageCommandsComponentState } from '@/context-store/states/contextStorePageCommandsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useCallback, useEffect, useId, useRef } from 'react';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

type PageCommandEffectProps = {
  engineComponentKey: EngineComponentKey;
  onRun: PageCommand['run'];
  isDisabled?: boolean;
  isLoading?: boolean;
  progress?: number;
};

export const PageCommandEffect = ({
  engineComponentKey,
  onRun,
  isDisabled = false,
  isLoading = false,
  progress,
}: PageCommandEffectProps) => {
  const registrationId = useId();
  // oxlint-disable-next-line twenty/no-state-useref
  const onRunRef = useRef(onRun);

  const setContextStorePageCommands = useSetAtomComponentState(
    contextStorePageCommandsComponentState,
  );

  const run = useCallback(() => onRunRef.current(), []);

  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  useEffect(() => {
    setContextStorePageCommands((pageCommands) => ({
      ...pageCommands,
      [engineComponentKey]: {
        run,
        isDisabled,
        isLoading,
        progress,
        registrationId,
      },
    }));
  }, [
    engineComponentKey,
    run,
    isDisabled,
    isLoading,
    progress,
    registrationId,
    setContextStorePageCommands,
  ]);

  useEffect(() => {
    return () => {
      setContextStorePageCommands((pageCommands) => {
        if (
          pageCommands[engineComponentKey]?.registrationId !== registrationId
        ) {
          return pageCommands;
        }

        const {
          [engineComponentKey]: _unregisteredPageCommand,
          ...otherPageCommands
        } = pageCommands;

        return otherPageCommands;
      });
    };
  }, [engineComponentKey, registrationId, setContextStorePageCommands]);

  return null;
};
