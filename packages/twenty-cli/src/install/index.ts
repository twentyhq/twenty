import gradient from 'gradient-string';
import chalk from 'chalk';
import { PromptObject } from 'prompts';

export const showWelcomeScreen = () => {
  const logo = `
                                                                                        
  &&&&&&&&&&&&&      &&&&&&&&&&&&&           
  &&&&&&&&&&&&&&   &&&&&&&&&&&&&&&&        
 &&&&            &&&&&          &&&&       
 &&&&         &&&&&&            &&&&       
 &&&&       &&&&&&   &&         &&&&       
          &&&&&    &&&&         &&&&       
       &&&&&&      &&&&         &&&&       
     &&&&&&        &&&&         &&&&       
   &&&&&           &&&&         &&&&       
 &&&&&&&&&&&&&&&&   &&&&&&&&&&&&&&&       
 &&&&&&&&&&&&&&&&     &&&&&&&&&&&&  
 
`;

  const items = logo.split('\n').map((row) => gradient.mind(row));

  /* eslint-disable no-console */
  console.log(chalk.bold(items.join('\n')));
  console.log(chalk.bold(`Welcome to Twenty!`));
  console.log(
    chalk.bold(
      gradient.mind(`We're building a modern alternative to Salesforce\n`),
    ),
  );
  console.log(chalk.bold(`Let's get you started!\n\n`));
  /* eslint-enable  no-console */
};

export const firstQuestion: PromptObject = {
  type: 'select',
  name: 'install_type',
  message: 'What do you want to do?',
  choices: [
    {
      title: 'Contribute to the code',
      description: 'I want to setup a development environment',
      value: 'contribute',
    },
    {
      title: 'Quickly try the product',
      description: 'I want to play with a demo version',
      value: 'demo',
    },
    {
      title: 'Self-host on a server',
      description: 'I want to host the app on a distant server',
      value: 'selfhost',
    },
  ],
};
