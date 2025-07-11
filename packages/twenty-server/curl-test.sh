#!/bin/bash

# Test script for Admin Impersonation API

echo "🚀 Testing Admin Impersonation API"
echo "================================="

# Configuration
BASE_URL="http://localhost:3000"
WORKSPACE_ID="test-workspace-id"  # Replace with actual workspace ID
ADMIN_TOKEN="your-admin-token"     # Replace with actual admin token

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Testing Admin Impersonation Endpoint${NC}"
echo "URL: ${BASE_URL}/rest/admin/workspaces/${WORKSPACE_ID}/impersonate"

if [ "$ADMIN_TOKEN" = "your-admin-token" ]; then
    echo -e "${RED}❌ Error: Please update ADMIN_TOKEN in this script${NC}"
    echo "To get admin token:"
    echo "1. Set user.canAccessFullAdminPanel = true in database"
    echo "2. Login and get access token"
    echo "3. Update ADMIN_TOKEN in this script"
    exit 1
fi

echo -e "${YELLOW}Making request...${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST \
  "${BASE_URL}/rest/admin/workspaces/${WORKSPACE_ID}/impersonate" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

# Split response and status code
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)

echo "Status Code: $status_code"
echo "Response Body: $body"

if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ Success! Impersonation token generated${NC}"
    
    # Extract token from response (assuming JSON response)
    token=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$token" ]; then
        echo -e "${GREEN}Token: $token${NC}"
        
        echo -e "${YELLOW}Step 2: Testing workspace access with impersonation token${NC}"
        
        # Test with generated token
        test_response=$(curl -s -w "\n%{http_code}" -X GET \
          "${BASE_URL}/rest/objects/people" \
          -H "Authorization: Bearer ${token}" \
          -H "Content-Type: application/json")
        
        test_body=$(echo "$test_response" | head -n -1)
        test_status=$(echo "$test_response" | tail -n 1)
        
        echo "Test Status Code: $test_status"
        echo "Test Response: $test_body"
        
        if [ "$test_status" = "200" ]; then
            echo -e "${GREEN}✅ Success! Workspace access works with impersonation token${NC}"
        else
            echo -e "${RED}❌ Failed: Could not access workspace with impersonation token${NC}"
        fi
    else
        echo -e "${RED}❌ Warning: Could not extract token from response${NC}"
    fi
    
elif [ "$status_code" = "401" ]; then
    echo -e "${RED}❌ Unauthorized: Check your admin token${NC}"
elif [ "$status_code" = "403" ]; then
    echo -e "${RED}❌ Forbidden: User is not Super Admin${NC}"
elif [ "$status_code" = "404" ]; then
    echo -e "${RED}❌ Not Found: Workspace not found or endpoint not available${NC}"
else
    echo -e "${RED}❌ Error: HTTP $status_code${NC}"
fi

echo -e "${YELLOW}Test completed!${NC}"