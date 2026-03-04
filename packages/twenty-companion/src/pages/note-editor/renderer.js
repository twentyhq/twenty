// Import styles
import './styles.css';

// Initialize the markdown editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize SimpleMDE Markdown Editor
  const editor = new SimpleMDE({
    element: document.getElementById('editor'),
    spellChecker: false,
    autofocus: true,
    status: false,
    toolbar: [
      'bold', 'italic', 'heading', '|', 
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'preview', 'side-by-side', 'fullscreen',
    ],
    placeholder: 'Write your notes here...',
    initialValue: document.getElementById('editor').textContent.trim(),
  });

  // Handle sidebar toggle
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const sidebar = document.getElementById('sidebar');
  const editorContent = document.querySelector('.editor-content');
  
  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    editorContent.classList.toggle('full-width');
  });

  // Handle back button
  const backButton = document.getElementById('backButton');
  backButton.addEventListener('click', () => {
    window.electronAPI.navigate('home');
  });

  // Chat input handling
  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendButton');
  
  // When send button is clicked
  sendButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
      console.log('Sending message:', message);
      // Here you would handle the AI chat functionality
      // For now, just clear the input
      chatInput.value = '';
    }
  });
  
  // Send message on Enter key
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendButton.click();
    }
  });

  // Handle share buttons
  const shareButtons = document.querySelectorAll('.share-btn');
  shareButtons.forEach(button => {
    button.addEventListener('click', () => {
      const action = button.textContent.trim();
      console.log(`Share action: ${action}`);
      // Implement actual sharing functionality here
    });
  });

  // Handle AI option buttons
  const aiButtons = document.querySelectorAll('.ai-btn');
  aiButtons.forEach(button => {
    button.addEventListener('click', () => {
      const action = button.textContent.trim();
      console.log(`AI action: ${action}`);
      // Implement actual AI functionality here
    });
  });
});