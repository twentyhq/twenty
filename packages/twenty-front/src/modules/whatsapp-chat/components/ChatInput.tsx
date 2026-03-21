import styled from '@emotion/styled';
import {
  type ClipboardEvent,
  type FocusEventHandler,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import {
  IconPaperclip,
  IconSend,
  IconTrash,
  IconX,
} from 'twenty-ui/display';
import { IconMic } from '@/whatsapp-chat/components/IconMic';

const StyledContainer = styled.div`
  background: #FFFFFF;
  border-top: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
`;

const StyledInputRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTextArea = styled.textarea`
  background: #F5F6F7;
  border: 1px solid #E5E7EB;
  border-radius: 20px;
  color: #111827;
  flex: 1;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.45;
  max-height: 120px;
  min-height: 38px;
  outline: none;
  padding: 8px 16px;
  resize: none;

  &::placeholder {
    color: #9CA3AF;
  }

  &:focus {
    border-color: #1A6CFF;
    background: #FFFFFF;
  }
`;

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  align-items: center;
  background: ${({ variant }) => {
    if (variant === 'primary') return '#1A6CFF';
    if (variant === 'danger') return '#EF4444';
    return 'transparent';
  }};
  border: ${({ variant }) =>
    variant === 'primary' || variant === 'danger'
      ? 'none'
      : '1px solid #E5E7EB'};
  border-radius: 50%;
  color: ${({ variant }) =>
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : '#6B7280'};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 38px;
  justify-content: center;
  width: 38px;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledRecordingBar = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledRecordingIndicator = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.color.red};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPulseDot = styled.div`
  animation: pulse 1.2s ease-in-out infinite;
  background: ${({ theme }) => theme.color.red};
  border-radius: 50%;
  height: 8px;
  width: 8px;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

const StyledTimer = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-variant-numeric: tabular-nums;
  min-width: 40px;
`;

const StyledPreviewRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-bottom: 8px;
`;

const StyledPreviewImage = styled.img`
  border: 1px solid #E5E7EB;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  max-height: 80px;
  max-width: 120px;
  object-fit: cover;
`;

const StyledRemovePreview = styled.button`
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  height: 20px;
  justify-content: center;
  margin-left: -28px;
  margin-top: -68px;
  width: 20px;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

type ChatInputProps = {
  onSendText: (body: string) => void;
  onSendMedia?: (file: File) => void;
  disabled?: boolean;
  /** External text injected by Sales Angel "Use in Chat" — appended to draft */
  externalDraft?: string | null;
  /** Called after externalDraft is consumed */
  onExternalDraftConsumed?: () => void;
};

export const ChatInput = ({
  onSendText,
  onSendMedia,
  disabled = false,
  externalDraft,
  onExternalDraftConsumed,
}: ChatInputProps) => {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [pastedFile, setPastedFile] = useState<File | null>(null);
  const [pastedPreview, setPastedPreview] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Disable global single-key hotkeys (g→o, /, @) while typing in chat
  const CHAT_INPUT_FOCUS_ID = 'whatsapp-chat-input';
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleFocus: FocusEventHandler<HTMLTextAreaElement> = useCallback(() => {
    pushFocusItemToFocusStack({
      focusId: CHAT_INPUT_FOCUS_ID,
      component: {
        type: FocusComponentType.TEXT_AREA,
        instanceId: CHAT_INPUT_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  }, [pushFocusItemToFocusStack]);

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = useCallback(() => {
    removeFocusItemFromFocusStackById({ focusId: CHAT_INPUT_FOCUS_ID });
  }, [removeFocusItemFromFocusStackById]);

  // Clean up focus stack on unmount
  useEffect(() => {
    return () => {
      removeFocusItemFromFocusStackById({ focusId: CHAT_INPUT_FOCUS_ID });
    };
  }, [removeFocusItemFromFocusStackById]);

  // Consume external draft (e.g. from Sales Angel "Use in Chat")
  useEffect(() => {
    if (externalDraft) {
      setText((prev) => (prev.trim() ? `${prev}\n\n${externalDraft}` : externalDraft));
      textAreaRef.current?.focus();
      onExternalDraftConsumed?.();
    }
  }, [externalDraft, onExternalDraftConsumed]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clearPastedFile = useCallback(() => {
    if (pastedPreview) {
      URL.revokeObjectURL(pastedPreview);
    }
    setPastedFile(null);
    setPastedPreview(null);
  }, [pastedPreview]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
    setDuration(0);
  }, []);

  const cancelRecording = useCallback(() => {
    chunksRef.current = [];
    stopRecording();
  }, [stopRecording]);

  const startRecording = useCallback(async () => {
    if (!onSendMedia || disabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')
        ? 'audio/ogg; codecs=opus'
        : 'audio/webm; codecs=opus';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const ext = mimeType.includes('ogg') ? 'ogg' : 'webm';
          const file = new File([blob], `voice-message.${ext}`, {
            type: mimeType,
          });
          onSendMedia(file);
        }
        chunksRef.current = [];
      };

      recorder.start(100);
      setRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      // User denied microphone or not available
    }
  }, [onSendMedia, disabled]);

  const sendRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
    setDuration(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const adjustHeight = useCallback(() => {
    const el = textAreaRef.current;

    if (!el) return;

    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleSend = useCallback(() => {
    if (disabled) return;

    // If there's a pasted image, send it
    if (pastedFile && onSendMedia) {
      onSendMedia(pastedFile);
      clearPastedFile();
      setText('');
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    onSendText(trimmed);
    setText('');

    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
  }, [text, disabled, onSendText, pastedFile, onSendMedia, clearPastedFile]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      if (!onSendMedia) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const preview = URL.createObjectURL(file);
            setPastedFile(file);
            setPastedPreview(preview);
          }
          return;
        }
      }
    },
    [onSendMedia],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file && onSendMedia) {
        onSendMedia(file);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onSendMedia],
  );

  const hasText = text.trim().length > 0;
  const hasContent = hasText || pastedFile !== null;

  if (recording) {
    return (
      <StyledContainer>
        <StyledInputRow>
          <StyledButton
            variant="secondary"
            onClick={cancelRecording}
            title="Cancel recording"
          >
            <IconTrash size={18} />
          </StyledButton>
          <StyledRecordingBar>
            <StyledRecordingIndicator>
              <StyledPulseDot />
              Recording
            </StyledRecordingIndicator>
            <StyledTimer>{formatDuration(duration)}</StyledTimer>
          </StyledRecordingBar>
          <StyledButton
            variant="primary"
            onClick={sendRecording}
            title="Send voice message"
          >
            <IconSend size={18} />
          </StyledButton>
        </StyledInputRow>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      {pastedPreview && (
        <StyledPreviewRow>
          <StyledPreviewImage src={pastedPreview} alt="Paste preview" />
          <StyledRemovePreview onClick={clearPastedFile} title="Remove image">
            <IconX size={12} />
          </StyledRemovePreview>
        </StyledPreviewRow>
      )}
      <StyledInputRow>
        {onSendMedia && (
          <>
            <StyledButton
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <IconPaperclip size={18} />
            </StyledButton>
            <StyledFileInput
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </>
        )}
        <StyledTextArea
          ref={textAreaRef}
          placeholder={pastedFile ? 'Add a caption... (Enter to send)' : 'Type a message...'}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          rows={1}
        />
        {hasContent ? (
          <StyledButton
            variant="primary"
            onClick={handleSend}
            disabled={disabled}
          >
            <IconSend size={18} />
          </StyledButton>
        ) : (
          <StyledButton
            variant="secondary"
            onClick={startRecording}
            disabled={disabled || !onSendMedia}
            title="Record voice message"
          >
            <IconMic size={18} />
          </StyledButton>
        )}
      </StyledInputRow>
    </StyledContainer>
  );
};
