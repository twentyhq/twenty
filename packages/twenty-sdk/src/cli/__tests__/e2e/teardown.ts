import { exec } from 'child_process';

export default async () =>
  new Promise<void>((resolve) => {
    exec('pkill -f "nest start" || true', (error: unknown) => {
      if (error) {
        console.log('No server processes to kill');
      } else {
        console.log('✅ Server processes cleaned up');
      }
      resolve();
    });
  });
