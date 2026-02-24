import { defineFrontComponent } from 'twenty-sdk';

export const MediaPlayer = () => {
  return (
    <video controls>
      <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4"/>
    </video>
  );
};

export default defineFrontComponent({
  universalIdentifier: '9f3bbb39-042d-4216-b8fc-bedfc3487208',
  name: 'Call Recording Media Player',
  description: 'A media player for call recordings',
  component: MediaPlayer,
});
