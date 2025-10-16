export default async function globalTeardown() {
  // Kill any remaining server processes
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    exec('pkill -f "nest start" || true', (error: unknown) => {
      if (error) {
        console.log('No server processes to kill');
      } else {
        console.log('✅ Server processes cleaned up');
      }
      resolve(undefined);
    });
  });
}
