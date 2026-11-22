import { useStore } from 'jotai';
import { useEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { createWebSpeechDictationEngine } from '@/ai-chat/dictation/engines/createWebSpeechDictationEngine';
import { useDictationAvailability } from '@/ai-chat/dictation/hooks/useDictationAvailability';
import { dictationEngineComponentState } from '@/ai-chat/dictation/states/dictationEngineComponentState';
import { hasWebSpeechProvenSilentState } from '@/ai-chat/dictation/states/hasWebSpeechProvenSilentState';
import { isDictationRecordingComponentState } from '@/ai-chat/dictation/states/isDictationRecordingComponentState';
import { getDictationFailureMessage } from '@/ai-chat/dictation/utils/getDictationFailureMessage';
import { getDictationLanguage } from '@/ai-chat/dictation/utils/getDictationLanguage';
import { readDictationSurface } from '@/ai-chat/dictation/utils/readDictationSurface';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useToast } from 'twenty-ui/components/feedback';

type AiChatDictationEffectProps = {
  onInterimText: (text: string) => void;
  onFinalText: (text: string) => void;
};

export const AiChatDictationEffect = ({
  onInterimText,
  onFinalText,
}: AiChatDictationEffectProps) => {
  const isSupported = useDictationAvailability();
  const store = useStore();

  const [dictationEngine, setDictationEngine] = useAtomComponentState(
    dictationEngineComponentState,
  );
  const setIsDictationRecording = useSetAtomComponentState(
    isDictationRecordingComponentState,
  );
  const setHasWebSpeechProvenSilent = useSetAtomState(
    hasWebSpeechProvenSilentState,
  );
  const { enqueueToast } = useToast();

  const { isIOS } = useMemo(() => readDictationSurface(), []);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const createdEngine = createWebSpeechDictationEngine({
      isIOS,
      getLanguage: () =>
        getDictationLanguage(
          store.get(currentWorkspaceMemberState.atom)?.locale,
        ),
    });

    setDictationEngine(createdEngine);

    return () => {
      createdEngine.dispose();
      setDictationEngine(null);
    };
  }, [isSupported, isIOS, store, setDictationEngine]);

  useEffect(() => {
    if (!isDefined(dictationEngine)) {
      return;
    }

    return dictationEngine.subscribe((event) => {
      switch (event.type) {
        case 'interim':
          onInterimText(event.text);
          break;
        case 'final':
          onFinalText(event.text);
          break;
        case 'state':
          setIsDictationRecording(event.state === 'recording');
          if (event.state === 'idle') {
            onInterimText('');
          }
          break;
        case 'error':
          if (event.reason === 'engine-silent' && isIOS) {
            setHasWebSpeechProvenSilent(true);
          }
          enqueueToast({
            status: 'error',
            children: getDictationFailureMessage(event.reason),
          });
          break;
      }
    });
  }, [
    dictationEngine,
    isIOS,
    onInterimText,
    onFinalText,
    setIsDictationRecording,
    setHasWebSpeechProvenSilent,
    enqueueToast,
  ]);

  return null;
};
