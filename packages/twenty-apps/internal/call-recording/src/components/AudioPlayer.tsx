import { SerializedEventData } from "twenty-sdk/dist/sdk/front-component-api";

export const AudioPlayer = ({ src, extension, onTimeUpdate }: { src: string, extension: string, onTimeUpdate?: (currentTimeSeconds: number) => void }) => {
  return (
    <audio controls style={{ width: '100%' }} onTimeUpdate={(event: unknown) => {
      const currentTime = (event as CustomEvent<SerializedEventData>).detail.currentTime;

      if (typeof currentTime === 'number') {
        onTimeUpdate?.(currentTime);
      }
    }}>
      <source src={src} type={`audio/${extension}`} />
    </audio>
  );
};
